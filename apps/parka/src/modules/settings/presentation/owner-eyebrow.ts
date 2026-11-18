import { useEffect, useSyncExternalStore } from 'react';
import { fetchSettings } from '../integration/repository';

type Form = 'Twoje' | 'Twój' | 'Twoja';

const SHARED: Record<Form, string> = {
  Twoje: 'Wasze',
  Twój: 'Wasz',
  Twoja: 'Wasza',
};

let deviceCount = 0;
let requested = false;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** Settings view reports what it already knows, so no second request. */
export const setKnownDeviceCount = (count: number): void => {
  requested = true;
  if (count === deviceCount) return;
  deviceCount = count;
  listeners.forEach((listener) => listener());
};

const requestOnce = () => {
  if (requested) return;
  requested = true;
  fetchSettings(new AbortController().signal)
    .then((settings) => setKnownDeviceCount(settings.devices.length))
    .catch(() => {
      requested = false;
    });
};

/**
 * Headline lead word of a main view: "Twoje" while one device writes to the
 * account, "Wasze" once more than one does.
 */
export const useOwnerEyebrow = (form: Form): string => {
  const count = useSyncExternalStore(
    subscribe,
    () => deviceCount,
    () => 0,
  );
  useEffect(requestOnce, []);
  return count > 1 ? SHARED[form] : form;
};
