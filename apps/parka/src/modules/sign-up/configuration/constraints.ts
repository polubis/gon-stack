export const FEATURE_NAME = 'SignUp';

export const ERROR_CODES = {
  render: 'SIGN_UP_RENDER',
  invalidInput: 'SIGN_UP_INVALID_INPUT',
  rejected: 'SIGN_UP_REJECTED',
} as const;

export const MESSAGES = {
  invalidInput: 'Podaj poprawny e-mail i hasło (min. 6 znaków).',
  rejectedFallback: 'Sign-up failed. Try again.',
  confirmation: 'Sprawdź skrzynkę e-mail i potwierdź rejestrację.',
} as const;
