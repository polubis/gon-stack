/** Pictures a user can pick for a device, with their Polish labels. */
export const DEVICE_AVATARS = {
  cat: 'Kot',
  dog: 'Pies',
  bird: 'Ptak',
  fish: 'Ryba',
  rabbit: 'Królik',
  rocket: 'Rakieta',
  star: 'Gwiazda',
  heart: 'Serce',
  coffee: 'Kawa',
  gamepad: 'Konsola',
  music: 'Muzyka',
  sun: 'Słońce',
} as const;

export type DeviceAvatarId = keyof typeof DEVICE_AVATARS;

export const DEVICE_AVATAR_IDS = Object.keys(DEVICE_AVATARS) as [
  DeviceAvatarId,
  ...DeviceAvatarId[],
];
