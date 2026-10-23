export const FEATURE_NAME = 'AccessTokens';

export const NAME_MAX_LENGTH = 60;

export const MAX_TOKENS = 10;

export const ERROR_CODES = {
  load: 'ACCESS_TOKENS_LOAD',
  render: 'ACCESS_TOKENS_RENDER',
} as const;

/** Lifetime choices of a new token; `never` is stored as no expiry. */
export const TTL_OPTIONS = [
  { value: '30', label: '30 dni' },
  { value: '7', label: '7 dni' },
  { value: '1', label: '1 dzień' },
  { value: '90', label: '90 dni' },
  { value: '365', label: '1 rok' },
  { value: 'never', label: 'Bez wygaśnięcia' },
];

export const DEFAULT_TTL = '30';

/** What a client connected with a token can do; mirrors the server tools. */
export const CAPABILITIES = [
  'Czytać zadania i wydatki',
  'Zmieniać status zadania (zrobione / do zrobienia)',
] as const;

export const NOT_ALLOWED =
  'Nic poza tym: bez edycji, tworzenia i usuwania zadań oraz bez zapisu wydatków.';

/** URL ids of the confirmation modals (see `shared/router/modal-stack`). */
export const MODAL = {
  create: 'token-new',
  rotate: 'token-rotate',
  revoke: 'token-revoke',
  remove: 'token-delete',
} as const;
