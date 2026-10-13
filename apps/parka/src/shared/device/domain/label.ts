import type { Device } from './models';

const COLORS = 8;

/** Name built from the details, e.g. "SM-S918B · Android 14 · Chrome". */
export const deviceAutoName = (
  device: Pick<Device, 'name' | 'model' | 'os' | 'browser'>,
): string => {
  const parts = [device.model, device.os, device.browser].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : device.name;
};

/** What a device is called on screen: the user's name, else the built one. */
export const deviceLabel = (
  device: Pick<Device, 'name' | 'model' | 'os' | 'browser' | 'customName'>,
): string => device.customName || deviceAutoName(device);

/** Short tail of the id, enough to tell two similar devices apart. */
export const deviceShortId = (id: string): string => `#${id.slice(-4)}`;

/** Technical name and resolution, secondary to the label. */
export const deviceDetailsLine = (
  device: Pick<Device, 'name' | 'screen' | 'model' | 'os' | 'browser'>,
): string =>
  [device.name, device.screen]
    .filter((part) => part && part !== deviceAutoName(device))
    .join(' · ');

/** Stable colour slot (0-7) of a device id, spread by an FNV-1a hash. */
export const deviceColorIndex = (id: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash = Math.imul(hash ^ id.charCodeAt(i), 0x01000193);
  }
  return (hash >>> 0) % COLORS;
};
