import {
  detectDeviceDetails,
  detectDeviceName,
  detectDeviceType,
} from '../domain/detect';
import type { DeviceHints, DeviceSignals } from '../domain/detect';
import type { Device } from '../domain/models';

const STORAGE_KEY = 'parka:device-id';

let memoryId: string | null = null;
let hints: DeviceHints = {};

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

type Nav = Navigator & {
  userAgentData?: DeviceSignals['userAgentData'] & {
    getHighEntropyValues?: (keys: string[]) => Promise<DeviceHints>;
  };
};

const signals = (): DeviceSignals => {
  const nav = navigator as Nav;
  return {
    userAgent: nav.userAgent,
    maxTouchPoints: nav.maxTouchPoints,
    userAgentData: nav.userAgentData,
  };
};

/**
 * Asks the browser for the model code and system version (Android Chromium
 * answers; others do not). Call early: `currentDevice` reads the answer later.
 */
export const loadDeviceHints = async (): Promise<void> => {
  try {
    hints =
      (await (navigator as Nav).userAgentData?.getHighEntropyValues?.([
        'model',
        'platformVersion',
      ])) ?? {};
  } catch {
    hints = {};
  }
};

export const currentDeviceId = (): string => deviceId();

/** The browser this code runs in. */
export const currentDevice = (): Device => {
  const now = signals();
  return {
    id: deviceId(),
    name: detectDeviceName(now),
    type: detectDeviceType(now),
    avatar: null,
    customName: null,
    ...detectDeviceDetails(now, hints, window.screen),
  };
};
