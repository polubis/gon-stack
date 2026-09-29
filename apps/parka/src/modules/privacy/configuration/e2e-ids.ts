export const PRIVACY_E2E_IDS = [
  'privacy:main',
  'privacy:points',
  'privacy:manage-data',
] as const;

export type PrivacyE2eId = (typeof PRIVACY_E2E_IDS)[number];
