export const PRIVACY_E2E_IDS = [
  'privacy:main',
  'privacy:points',
  'privacy:manage-data',
] as const;

export type PrivacyE2eId = (typeof PRIVACY_E2E_IDS)[number];

export const AI_INFO_E2E_IDS = ['ai-info:main', 'ai-info:steps'] as const;

export type AiInfoE2eId = (typeof AI_INFO_E2E_IDS)[number];

export const DATA_EXPORT_E2E_IDS = [
  'data-export:main',
  'data-export:format',
  'data-export:run',
  'data-export:done',
] as const;

export type DataExportE2eId = (typeof DATA_EXPORT_E2E_IDS)[number];
