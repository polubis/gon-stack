export type Profile = {
  name: string;
  email: string;
};

export type NotificationKey =
  'limitWarnings' | 'receiptConfirmations' | 'limitAlerts' | 'push' | 'email';

export type Settings = {
  profile: Profile;
  notifications: Record<NotificationKey, boolean>;
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
