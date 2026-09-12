export const AUTH_E2E_IDS = [
  'auth:main',
  'auth:email',
  'auth:password',
  'auth:submit',
  'auth:google',
  'auth:apple',
] as const;

export type AuthE2eId = (typeof AUTH_E2E_IDS)[number];
