import type {
  ConsentCategoryId,
  ConsentPreferences,
  ConsentRecord,
} from '../domain/models';

export const CONSENT_VERSION = 1;

export const categoryOrder: ConsentCategoryId[] = [
  'essential',
  'analytics',
  'personalization',
  'marketing',
];

export const defaultPreferences: ConsentPreferences = {
  essential: true,
  analytics: false,
  personalization: false,
  marketing: false,
};

export const acceptAllPreferences = (): ConsentPreferences => ({
  essential: true,
  analytics: true,
  personalization: true,
  marketing: true,
});

export const toggleCategoryPreference = (
  preferences: ConsentPreferences,
  id: ConsentCategoryId,
): ConsentPreferences => {
  if (id === 'essential') return preferences;

  return { ...preferences, [id]: !preferences[id] };
};

export const createConsentRecord = (
  preferences: ConsentPreferences,
): ConsentRecord => ({
  version: CONSENT_VERSION,
  preferences,
  updatedAt: new Date().toISOString(),
});
