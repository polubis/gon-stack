export const SIGN_IN_E2E_IDS = [
  'auth:main',
  'auth:email',
  'auth:password',
  'auth:submit',
  'auth:google',
  'auth:apple',
] as const;

export type SignInE2eId = (typeof SIGN_IN_E2E_IDS)[number];
