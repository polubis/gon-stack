import type {
  ConsentCategoryId,
  ConsentPreferences,
  ConsentRecord,
} from '../domain/models';

export const CONSENT_VERSION = 2;

export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export const categoryOrder: ConsentCategoryId[] = ['necessary', 'performance'];

export const defaultPreferences: ConsentPreferences = {
  necessary: true,
  performance: false,
};

export const acceptAllPreferences = (): ConsentPreferences => ({
  necessary: true,
  performance: true,
});

export const toggleCategoryPreference = (
  preferences: ConsentPreferences,
  id: ConsentCategoryId,
): ConsentPreferences => {
  if (id === 'necessary') return preferences;

  return { ...preferences, [id]: !preferences[id] };
};

export const isConsentExpired = (record: ConsentRecord): boolean => {
  const updatedAt = Date.parse(record.updatedAt);

  return Number.isNaN(updatedAt) || Date.now() - updatedAt > CONSENT_MAX_AGE_MS;
};

export const createConsentRecord = (
  preferences: ConsentPreferences,
): ConsentRecord => ({
  version: CONSENT_VERSION,
  preferences,
  updatedAt: new Date().toISOString(),
});
