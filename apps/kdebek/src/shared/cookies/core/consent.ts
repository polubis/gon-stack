import type {
  ConsentCategoryId,
  ConsentPreferences,
  ConsentRecord,
} from '../domain/models';

export const CONSENT_VERSION = 1;

export const categoryOrder: ConsentCategoryId[] = [
  'necessary',
  'performance',
  'functional',
  'marketing',
];

export const defaultPreferences: ConsentPreferences = {
  necessary: true,
  performance: false,
  functional: false,
  marketing: false,
};

export const acceptAllPreferences = (): ConsentPreferences => ({
  necessary: true,
  performance: true,
  functional: true,
  marketing: true,
});

export const toggleCategoryPreference = (
  preferences: ConsentPreferences,
  id: ConsentCategoryId,
): ConsentPreferences => {
  if (id === 'necessary') return preferences;

  return { ...preferences, [id]: !preferences[id] };
};

export const createConsentRecord = (
  preferences: ConsentPreferences,
): ConsentRecord => ({
  version: CONSENT_VERSION,
  preferences,
  updatedAt: new Date().toISOString(),
});
