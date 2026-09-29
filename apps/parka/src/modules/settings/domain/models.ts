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

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
};
