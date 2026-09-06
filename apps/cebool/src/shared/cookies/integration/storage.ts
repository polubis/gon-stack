import { CONSENT_VERSION, createConsentRecord } from '../core/consent';
import type { ConsentPreferences, ConsentRecord } from '../domain/models';

const STORAGE_KEY = 'cebool:cookie-consent';

// Cached against the raw string so repeated reads return a stable reference
// when nothing changed, as required by useSyncExternalStore's snapshot contract.
let cachedRaw: string | null = null;
let cachedRecord: ConsentRecord | null = null;

const parseConsent = (raw: string): ConsentRecord | null => {
  try {
    const parsed = JSON.parse(raw) as ConsentRecord;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
};

export const readConsent = (): ConsentRecord | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedRecord;

  cachedRaw = raw;
  cachedRecord = raw ? parseConsent(raw) : null;
  return cachedRecord;
};

export const getConsentServerSnapshot = (): ConsentRecord | null => null;

const subscribers = new Set<() => void>();

export const subscribeToConsent = (listener: () => void): (() => void) => {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
};

export const writeConsent = (preferences: ConsentPreferences): void => {
  const record = createConsentRecord(preferences);

  try {
    const raw = JSON.stringify(record);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedRecord = record;
  } catch {
    // Storage may be unavailable (private mode / blocked) — consent then simply isn't persisted.
  }

  subscribers.forEach((listener) => listener());
};
