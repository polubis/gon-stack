import type { Device } from '@/shared/device/domain/models';

export type Profile = {
  name: string;
};

/** Square WebP variants of the user's picture. */
export type Avatar = {
  variants: { size: number; url: string }[];
};

export type NotificationKey =
  'limitWarnings' | 'receiptConfirmations' | 'limitAlerts' | 'push' | 'email';

/** What this browser can do about push; independent of the saved preference. */
export type PushState =
  'checking' | 'unsupported' | 'unconfigured' | 'blocked' | 'off' | 'on';

export type Settings = {
  profile: Profile;
  notifications: Record<NotificationKey, boolean>;
  /** Devices expenses were made from. */
  devices: Device[];
};

export type NoticeBody =
  | { tone: 'success'; message: string }
  | {
      tone: 'error';
      title: string;
      code: string;
      description: string;
      /** Re-runs the failed action. */
      retry?: () => void;
    };

export type Notice = { id: number } & NoticeBody;
