import type { DeviceAvatarId } from './avatars';

export type DeviceType = 'mobile' | 'desktop' | 'tablet';

/** A browser installation an expense can be created from. */
export type Device = {
  /** Stable per browser. */
  id: string;
  /** Readable, e.g. "Chrome on Windows". */
  name: string;
  type: DeviceType;
  /** Picture the user chose; `null` shows the icon of the type. */
  avatar: DeviceAvatarId | null;
};
