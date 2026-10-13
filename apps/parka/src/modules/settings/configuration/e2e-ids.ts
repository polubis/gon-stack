export const SETTINGS_E2E_IDS = [
  'settings:main',
  'settings:name',
  'settings:edit-profile',
  'settings:profile-name',
  'settings:profile-email',
  'settings:save-profile',
  'settings:appearance',
  'settings:notifications',
  'settings:devices',
  'settings:identify-device',
  'settings:device-announcement',
  'settings:avatar',
  'settings:avatar-image',
  'settings:avatar-input',
  'settings:avatar-change',
  'settings:sign-out',
  'settings:load-error',
  'settings:toast',
] as const;

export type SettingsE2eDynamicId =
  | `settings:device:${string}`
  | `settings:device-avatar:${string}`
  | `settings:device-name:${string}`
  | `settings:device-this:${string}`;

export type SettingsE2eId =
  (typeof SETTINGS_E2E_IDS)[number] | SettingsE2eDynamicId;
