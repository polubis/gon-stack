export const SETTINGS_E2E_IDS = [
  'settings:main',
  'settings:name',
  'settings:edit-profile',
  'settings:profile-name',
  'settings:profile-email',
  'settings:save-profile',
  'settings:notifications',
  'settings:sign-out',
] as const;

export type SettingsE2eId = (typeof SETTINGS_E2E_IDS)[number];
