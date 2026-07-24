import { CONSENT_VERSION, createConsentRecord } from '../core/consent';
import type { ConsentPreferences, ConsentRecord } from '../domain/models';

const STORAGE_KEY = 'kdebek:cookie-consent';

export const readConsent = (): ConsentRecord | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.version !== CONSENT_VERSION) return null;

    return parsed;
  } catch {
    return null;
  }
};

export const writeConsent = (preferences: ConsentPreferences): void => {
  const record = createConsentRecord(preferences);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage may be unavailable (private mode / blocked) — consent then simply isn't persisted.
  }
};
