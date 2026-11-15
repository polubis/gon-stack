export const FEATURE_NAME = 'Knowledge';

export const TITLE_MAX_LENGTH = 120;
export const NOTES_MAX_LENGTH = 2000;
export const FOLDER_NAME_MAX_LENGTH = 40;
export const TAG_MAX_LENGTH = 24;
export const TAGS_MAX_COUNT = 8;

/** Id of the built-in medium priority, preselected for a new node. */
export const DEFAULT_PRIORITY_ID = 'medium';

/** Simulated round trip of the mock gateway. */
export const MOCK_LATENCY_MS = 350;

/** Skeleton rows per folder while the first load runs. */
export const SKELETON_ROWS = 3;

export const ERROR_CODES = {
  load: 'KNOWLEDGE_LOAD',
  render: 'KNOWLEDGE_RENDER',
} as const;
