export const NOTIFICATIONS_E2E_IDS = [
  'notifications:main',
  'notifications:list',
] as const;

export type NotificationsE2eId = (typeof NOTIFICATIONS_E2E_IDS)[number];
