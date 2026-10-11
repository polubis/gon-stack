import { detectDeviceName, detectDeviceType } from '../domain/detect';
import type { DeviceSignals } from '../domain/detect';
import type { Device } from '../domain/models';

const STORAGE_KEY = 'parka:device-id';

let memoryId: string | null = null;

/** Stable per browser; kept in memory when storage is unavailable. */
const deviceId = (): string => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const created = `device-${crypto.randomUUID()}`;
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    memoryId ??= `device-${crypto.randomUUID()}`;
    return memoryId;
  }
};

const signals = (): DeviceSignals => {
  const nav = navigator as Navigator & {
    userAgentData?: DeviceSignals['userAgentData'];
  };
  return {
    userAgent: nav.userAgent,
    maxTouchPoints: nav.maxTouchPoints,
    userAgentData: nav.userAgentData,
  };
};

/** The browser this code runs in. */
export const currentDevice = (): Device => {
  const now = signals();
  return {
    id: deviceId(),
    name: detectDeviceName(now),
    type: detectDeviceType(now),
  };
};
