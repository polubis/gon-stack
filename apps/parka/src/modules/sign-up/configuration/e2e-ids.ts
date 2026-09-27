export const SIGN_UP_E2E_IDS = [
  'auth:main',
  'auth:email',
  'auth:password',
  'auth:submit',
  'auth:google',
  'auth:apple',
] as const;

export type SignUpE2eId = (typeof SIGN_UP_E2E_IDS)[number];
