export const FEATURE_NAME = 'SignIn';

export const ERROR_CODES = {
  render: 'SIGN_IN_RENDER',
  invalidInput: 'SIGN_IN_INVALID_INPUT',
  rejected: 'SIGN_IN_REJECTED',
} as const;

export const MESSAGES = {
  invalidInput: 'Podaj poprawny e-mail i hasło (min. 6 znaków).',
  rejectedFallback: 'Sign-in failed. Try again.',
} as const;
