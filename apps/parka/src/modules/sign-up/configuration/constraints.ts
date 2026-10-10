export const FEATURE_NAME = 'SignUp';

export const ERROR_CODES = {
  render: 'SIGN_UP_RENDER',
} as const;

export const MESSAGES = {
  invalidInput: 'Enter a valid email and password (min. 6 characters).',
  rejectedFallback: 'Sign-up failed. Try again.',
  confirmation: 'Sprawdź skrzynkę e-mail i potwierdź rejestrację.',
} as const;
