import type { AvatarSize } from '../../avatar/domain/rules';
import type { DeviceAvatarId } from './avatars';

export type DeviceType = 'mobile' | 'desktop' | 'tablet';

/** What the browser reports about itself; `null` when it does not say. */
export type DeviceDetails = {
  /** Raw model code, e.g. "SM-S918B"; only Android Chromium exposes it. */
  model: string | null;
  /** System with major version, e.g. "Android 14". */
  os: string | null;
  browser: string | null;
  /** Screen resolution, e.g. "412×915". */
  screen: string | null;
};

/** Square WebP variants of a picture the user uploaded. */
export type DevicePhoto = {
  variants: { size: AvatarSize; url: string }[];
};

/** A browser installation an expense can be created from. */
export type Device = DeviceDetails & {
  /** Stable per browser. */
  id: string;
  /** Technical name, e.g. "Chrome on Windows". */
  name: string;
  type: DeviceType;
  /** Picture the user chose; `null` shows the icon of the type. */
  avatar: DeviceAvatarId | null;
  /** Name the user gave; `null` shows the name built from the details. */
  customName: string | null;
  /** Photo the user uploaded; wins over `avatar`. `null` when none. */
  photo: DevicePhoto | null;
};
